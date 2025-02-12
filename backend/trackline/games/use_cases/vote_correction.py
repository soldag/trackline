from injector import Inject
from pydantic import BaseModel

from trackline.constants import CORRECTION_PROPOSAL_MIN_VOTES
from trackline.core.db.client import DatabaseClient
from trackline.core.exceptions import UseCaseException
from trackline.core.fields import ResourceId
from trackline.games.models import (
    CorrectionProposalState,
    CorrectionProposalVote,
    GameState,
)
from trackline.games.schemas import (
    CorrectionProposalVoteOut,
    CorrectionProposalVoteResultOut,
    CorrectionVoted,
    TurnScoringOut,
)
from trackline.games.services.notifier import Notifier
from trackline.games.services.scoring_service import ScoringService
from trackline.games.use_cases.base import BaseHandler


class VoteCorrection(BaseModel):
    game_id: ResourceId
    turn_id: int
    agree: bool

    class Handler(BaseHandler):
        def __init__(
            self,
            db: Inject[DatabaseClient],
            scoring_service: Inject[ScoringService],
            notifier: Inject[Notifier],
        ) -> None:
            super().__init__(db)
            self._scoring_service = scoring_service
            self._notifier = notifier

        async def execute(
            self, user_id: ResourceId, use_case: "VoteCorrection"
        ) -> CorrectionProposalVoteResultOut:
            game = await self._get_game(use_case.game_id)
            self._assert_is_player(game, user_id)
            self._assert_has_state(game, GameState.SCORING)
            self._assert_is_active_turn(game, use_case.turn_id)

            turn = game.turns[use_case.turn_id]
            proposal = turn.correction_proposal
            if not proposal:
                raise UseCaseException(
                    code="PROPOSAL_NOT_FOUND",
                    message="There's no correction proposal for this turn.",
                    status_code=404,
                )
            if user_id in proposal.votes:
                raise UseCaseException(
                    code="ALREADY_VOTED",
                    message="You have already voted for this proposal.",
                    status_code=400,
                )

            vote = CorrectionProposalVote(agree=use_case.agree)
            proposal.votes[user_id] = vote

            all_votes = proposal.votes.values()
            accepted_share = sum(v.agree for v in all_votes) / len(game.players)
            rejected_share = sum(not v.agree for v in all_votes) / len(game.players)
            if accepted_share > CORRECTION_PROPOSAL_MIN_VOTES:
                proposal.state = CorrectionProposalState.ACCEPTED
            elif rejected_share >= 1 - CORRECTION_PROPOSAL_MIN_VOTES:
                proposal.state = CorrectionProposalState.REJECTED

            scoring_out: TurnScoringOut | None = None
            if proposal.state == CorrectionProposalState.ACCEPTED:
                turn.track.release_year = proposal.release_year

                scoring = await self._scoring_service.score_turn(game, use_case.turn_id)
                scoring_out = TurnScoringOut.from_model(scoring)

            await game.save_changes(session=self._db.session)

            vote_out = CorrectionProposalVoteOut.from_model(user_id, vote)
            await self._notifier.notify(
                user_id,
                game,
                CorrectionVoted(
                    vote=vote_out,
                    proposal_state=proposal.state,
                    scoring=scoring_out,
                ),
            )

            return CorrectionProposalVoteResultOut(
                vote=vote_out,
                proposal_state=proposal.state,
                scoring=scoring_out,
            )
