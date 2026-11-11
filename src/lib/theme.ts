// Approximate palette from CLAUDE.md; category colors come from the design canvas later.
export const colors = {
  paper: '#F8F4E9',
  ink: '#3A2A1F',
  inkSoft: '#7A6650',
  accent: '#C1543A',
  washi: '#F2B880',
  error: '#A33A25',
  line: 'rgba(58,42,31,0.25)',
};

// Cards sit on the page like paper: a tight, warm shadow rather than a generic soft one.
export const paperShadow = { boxShadow: '0px 2px 3px rgba(58,42,31,0.18)' } as const;

export const fonts = {
  hand: 'Caveat_700Bold',
  handSemi: 'Caveat_600SemiBold',
  body: 'Quicksand_500Medium',
  bodySemi: 'Quicksand_600SemiBold',
  bodyBold: 'Quicksand_700Bold',
};
