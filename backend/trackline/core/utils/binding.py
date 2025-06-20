from collections.abc import Sequence
from dataclasses import asdict, field, make_dataclass
from typing import Annotated, Any

from fastapi import Body, Depends, Path, Query, Request
from fastapi.exceptions import RequestValidationError
from pydantic import BaseModel, ValidationError
from pydantic_core import ErrorDetails, PydanticUndefined


def Bind[TModel: BaseModel](  # noqa: N802
    model_type: type[TModel],
    path: Sequence[str] | None = None,
    query: Sequence[str] | None = None,
    body: Sequence[str] | None = None,
) -> TModel:
    """
    Binds different parts of a request to a single model.

    This is needed in case FastAPI doesn't automatically infer
    the intended location correctly for some fields.
    """

    fields: list[tuple[str, Any, Any]] = []
    for field_name, field_info in model_type.model_fields.items():
        annotations = [*field_info.metadata]
        if path and field_name in path:
            annotations.append(Path())
        if query and field_name in query:
            annotations.append(Query())
        if body and field_name in body:
            annotations.append(Body(embed=True))

        field_type: type | object
        if annotations:
            field_type = Annotated[field_info.annotation, *annotations]
        else:
            field_type = field_info.annotation

        field_kwargs = {}
        if field_info.default != PydanticUndefined:
            field_kwargs["default"] = field_info.default
        if field_info.default_factory:
            field_kwargs["default_factory"] = field_info.default_factory

        fields.append(
            (
                field_name,
                field_type,
                field(**field_kwargs),
            ),
        )

    ModelWrapper = make_dataclass(  # noqa: N806
        cls_name=model_type.__name__,
        fields=fields,
    )

    async def unwrap(request: Request, wrapper: Any = Depends(ModelWrapper)) -> TModel:  # noqa: ANN401
        try:
            return model_type(**asdict(wrapper))
        except ValidationError as e:
            body = await request.body()
            raise RequestValidationError(
                _convert_pydantic_errors(request, e.errors()),
                body=body,
            ) from e

    return Depends(unwrap)


def _convert_pydantic_errors(
    request: Request,
    errors: list[ErrorDetails],
) -> list[ErrorDetails]:
    result: list[ErrorDetails] = []
    for error in errors:
        loc = error["loc"]
        if loc[0] in request.path_params:
            source = "path"
        elif loc[0] in request.query_params:
            source = "query"
        else:
            source = "body"

        result.append({**error, "loc": (source, *loc)})

    return result
