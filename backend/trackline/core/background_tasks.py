import asyncio
import logging
from types import TracebackType
from typing import Self

from fastapi_injector import RequestScopeFactory
from injector import Injector, inject

from trackline.core.use_cases import AnonymousUseCase, UseCaseExecutor

log = logging.getLogger(__name__)


class BackgroundTaskManager:
    @inject
    def __init__(
        self, injector: Injector, request_scope_factory: RequestScopeFactory
    ) -> None:
        self._injector = injector
        self._request_scope_factory = request_scope_factory

        self._task_queue: asyncio.Queue[AnonymousUseCase] = asyncio.Queue()
        self._worker_task: asyncio.Task[None] | None = None

    async def __aenter__(self) -> Self:
        self._worker_task = asyncio.create_task(self._run_worker())
        return self

    async def __aexit__(
        self,
        exc_type: type[BaseException] | None,
        exc_val: BaseException | None,
        exc_tb: TracebackType | None,
    ) -> bool | None:
        self._task_queue.shutdown(immediate=False)

        if worker_task := self._worker_task:
            worker_task.cancel()
            await asyncio.wait((worker_task,))

        while not self._task_queue.empty():
            self._task_queue.get_nowait()

    def schedule(self, use_case: AnonymousUseCase) -> None:
        self._task_queue.put_nowait(use_case)

    async def _run_worker(self) -> None:
        while True:
            try:
                use_case = await self._task_queue.get()
            except asyncio.QueueShutDown:
                return

            try:
                async with self._request_scope_factory.create_scope():
                    executor = self._injector.get(UseCaseExecutor)
                    await executor.execute(use_case)
            except asyncio.CancelledError:
                raise
            except Exception:
                log.exception(
                    "Failed to execute background task %s",
                    type(use_case).__name__,
                )
            else:
                log.info(
                    "Finished execution of background task %s",
                    type(use_case).__name__,
                )
