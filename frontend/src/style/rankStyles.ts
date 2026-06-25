export interface RankStyle {
  background: string;
  color: string;
  ring: string;
  shadow: string;
}

const RANK_STYLES: Record<number, RankStyle> = {
  1: {
    background: "linear-gradient(135deg, #ffe179 0%, #f5b942 100%)",
    color: "#5a4300",
    ring: "#f5b942",
    shadow: "0 0 24px rgba(245, 185, 66, 0.55)",
  },
  2: {
    background: "linear-gradient(135deg, #eef1f5 0%, #b9c0cc 100%)",
    color: "#3a4250",
    ring: "#b9c0cc",
    shadow: "0 0 18px rgba(185, 192, 204, 0.45)",
  },
  3: {
    background: "linear-gradient(135deg, #e8a06a 0%, #c4763a 100%)",
    color: "#4a2606",
    ring: "#c4763a",
    shadow: "0 0 18px rgba(196, 118, 58, 0.45)",
  },
};

export const getRankStyle = (position: number): RankStyle | undefined =>
  RANK_STYLES[position];
