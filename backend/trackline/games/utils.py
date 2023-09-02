from trackline.games.models import Track


def is_valid_release_year(
    timeline: list[Track], position: int, release_year: int
) -> bool:
    if position == 0:
        min_year = 0
    else:
        min_year = timeline[position - 1].release_year

    if position == len(timeline):
        max_year = float("inf")
    else:
        max_year = timeline[position].release_year

    return min_year <= release_year <= max_year
