from injector import Inject
from pydantic import BaseModel

from trackline.core.db.repository import Repository
from trackline.core.exceptions import UseCaseError
from trackline.core.fields import ResourceId
from trackline.games.models import (
    CorrectionProposal,
    CorrectionProposalState,
    CorrectionProposalVote,
    GameState,
)
from trackline.games.schemas import CorrectionProposalOut, CorrectionProposed
from trackline.games.services.notifier import Notifier
from trackline.games.use_cases.base import BaseHandler


class ProposeCorrection(BaseModel):
    game_id: ResourceId
    turn_id: int
    release_year: int

    class Handler(BaseHandler):
        def __init__(
            self,
            repository: Inject[Repository],
            notifier: Inject[Notifier],
        ) -> None:
            super().__init__(repository)
            self._notifier = notifier

        async def execute(
            self,
            user_id: ResourceId,
            use_case: "ProposeCorrection",
        ) -> CorrectionProposalOut:
            game = await self._get_game(use_case.game_id)
            self._assert_is_player(game, user_id)
            self._assert_has_state(game, GameState.SCORING)
            self._assert_is_active_turn(game, use_case.turn_id)

            turn = game.turns[use_case.turn_id]
            match turn.correction_proposal:
                case CorrectionProposal(state=CorrectionProposalState.VOTING):
                    raise UseCaseError(
                        code="CORRECTION_VOTING_ACTIVE",
                        message=(
                            "Another user has already proposed a correction "
                            "that's up for vote."
                        ),
                        status_code=400,
                    )
                case CorrectionProposal(state=CorrectionProposalState.ACCEPTED):
                    raise UseCaseError(
                        code="CORRECTION_VOTING_ACCEPTED",
                        message=(
                            "Another user has already proposed a correction "
                            "that was accepted."
                        ),
                        status_code=400,
                    )
            if use_case.release_year == turn.track.release_year:
                raise UseCaseError(
                    code="SAME_RELEASE_YEAR",
                    message=(
                        "The proposed release year must differ from the track's "
                        "original release year."
                    ),
                    status_code=400,
                )

            proposal = CorrectionProposal(
                created_by=user_id,
                release_year=use_case.release_year,
                votes={
                    user_id: CorrectionProposalVote(agree=True),
                },
            )

            turn.correction_proposal = proposal
            turn.passes.clear()

            proposal_out = CorrectionProposalOut.from_model(proposal)
            await self._notifier.notify(
                user_id,
                game,
                CorrectionProposed(proposal=proposal_out),
            )

            return proposal_out
