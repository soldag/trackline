import asyncio
import random
from typing import Any, ClassVar, Protocol, Self, overload

from injector import Injector, inject
from pydantic import BaseModel

from trackline.core.db.client import DatabaseClient
from trackline.core.db.unit_of_work import TransactionConflictError, UnitOfWork
from trackline.core.exceptions import RequestError
from trackline.core.fields import ResourceId
from trackline.core.settings import Settings


class AnonymousUseCase[TResult = None](BaseModel):
    handler_cls: ClassVar[
        type["AnonymousUseCaseHandler[Self, TResult]"] | None  # type: ignore[reportGeneralTypeIssues]
    ] = None

    @classmethod
    def register_handler[THandler](cls, handler_cls: type[THandler]) -> type[THandler]:
        cls.handler_cls = handler_cls  # type: ignore[reportAttributeAccessIssue]
        return handler_cls


class AuthenticatedUseCase[TResult = None](BaseModel):
    handler_cls: ClassVar[
        type["AuthenticatedUseCaseHandler[Self, TResult]"] | None  # type: ignore[reportGeneralTypeIssues]
    ] = None

    @classmethod
    def register_handler[THandler](cls, handler_cls: type[THandler]) -> type[THandler]:
        cls.handler_cls = handler_cls  # type: ignore[reportAttributeAccessIssue]
        return handler_cls


class AnonymousUseCaseHandler[
    UseCaseT: AnonymousUseCase[Any],
    TResult = None,
](Protocol):
    async def execute(self, use_case: UseCaseT) -> TResult: ...


class AuthenticatedUseCaseHandler[
    UseCaseT: AuthenticatedUseCase[Any],
    TResult = None,
](Protocol):
    async def execute(self, user_id: ResourceId, use_case: UseCaseT) -> TResult: ...


class MissingHandlerError(RuntimeError):
    def __init__(self, use_case_cls: object) -> None:
        cls_name = use_case_cls.__class__.__name__
        super().__init__(f"No handler registered for use case {cls_name}")


class UseCaseExecutor:
    @inject
    def __init__(
        self,
        injector: Injector,
        db_client: DatabaseClient,
        settings: Settings,
        unit_of_work: UnitOfWork,
    ) -> None:
        self._injector = injector
        self._db_client = db_client
        self._settings = settings
        self._unit_of_work = unit_of_work

    @overload
    async def execute[TResult](
        self, use_case: AnonymousUseCase[TResult]
    ) -> TResult: ...

    @overload
    async def execute[TResult](
        self, use_case: AuthenticatedUseCase[TResult], user_id: ResourceId
    ) -> TResult: ...

    async def execute[TResult](
        self,
        use_case: AnonymousUseCase[TResult] | AuthenticatedUseCase[TResult],
        user_id: ResourceId | None = None,
    ) -> TResult:
        for attempt in range(self._settings.db_txn_retries_max_attempts):
            try:
                async with self._db_client.start_session():
                    result = await self._execute_use_case(use_case, user_id)
                    await self._unit_of_work.save_changes()
            except TransactionConflictError:
                await asyncio.sleep(self._get_retry_interval(attempt))
                continue

            return result

        raise RequestError(
            code="REQUEST_CONFLICT",
            message=(
                "The request could not be executed due "
                "to a conflict with another request."
            ),
            status_code=409,
        )

    async def _execute_use_case[TResult](
        self,
        use_case: AnonymousUseCase[TResult] | AuthenticatedUseCase[TResult],
        user_id: ResourceId | None,
    ) -> TResult:
        if isinstance(use_case, AnonymousUseCase):
            handler_cls = use_case.handler_cls
            if not handler_cls:
                raise MissingHandlerError(use_case)

            handler = self._injector.get(handler_cls)
            result = await handler.execute(use_case)
        else:
            handler_cls = use_case.handler_cls
            if not handler_cls:
                raise MissingHandlerError(use_case)

            if user_id is None:
                raise ValueError("User ID must be provided for authorized use cases")

            handler = self._injector.get(handler_cls)
            result = await handler.execute(user_id, use_case)

        return result

    def _get_retry_interval(self, attempt: int) -> float:
        base_interval = self._settings.db_txn_retries_min_interval * 2**attempt
        jitter = random.randrange(0, self._settings.db_txn_retries_jitter)  # noqa: S311
        return (base_interval + jitter) / 1000
