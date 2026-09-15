const paths = {
 arrow:'M4 12h15m-6-6 6 6-6 6', chevron:'m9 5 7 7-7 7', down:'m6 9 6 6 6-6', close:'m6 6 12 12M6 18 18 6', plus:'M12 5v14M5 12h14',
 home:'m3 10 9-7 9 7v10H15v-7H9v7H3Z', users:'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2m20 0v-2a4 4 0 0 0-3-3.87M13 3.13a4 4 0 0 1 0 7.75M13 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0',
 flask:'M9 3h6m-5 0v6L4 19a1 1 0 0 0 1 2h14a1 1 0 0 0 1-2L14 9V3M8 14h8', cube:'m12 2 9 5v10l-9 5-9-5V7Zm0 10 9-5M12 12v10M3 7l9 5M7 4l10 6v7',
 chart:'M4 3v18h17M8 15l4-5 4 2 5-7', report:'M6 3h9l4 4v14H6Zm8 0v5h5M9 12h7M9 16h7', settings:'m12 2 2 3 3-.3.5 3 3 1-1 3 1 3-3 1-.5 3-3-.3-2 3-2-3-3 .3-.5-3-3-1 1-3-1-3 3-1 .5-3 3 .3ZM15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0',
 search:'m20 20-5-5M17 10a7 7 0 1 1-14 0 7 7 0 0 1 14 0', bell:'M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4',
 power:'M12 2v10M7 5a9 9 0 1 0 10 0', clock:'M12 7v5l3 2M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0', target:'M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0M17 12a5 5 0 1 1-10 0 5 5 0 0 1 10 0M13 12h-2',
 scan:'M8 3H3v5m13-5h5v5M3 16v5h5m8 0h5v-5M16 11a4 4 0 1 1-8 0 4 4 0 0 1 8 0m-9 7c2-3 8-3 10 0', spark:'m12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5Z',
 camera:'M4 7h4l2-3h4l2 3h4v14H4Zm12 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0', shield:'m12 2 9 4v6c0 6-9 10-9 10S3 18 3 12V6Zm-4 10 3 3 5-6',
 lock:'M6 10h12v11H6ZM8 10V6a4 4 0 0 1 8 0v4m-4 4v3', download:'M12 3v12m-5-5 5 5 5-5M4 15v6h16v-6', share:'m8 11 8-5M8 13l8 5M8 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0M22 4a3 3 0 1 1-6 0 3 3 0 0 1 6 0M22 20a3 3 0 1 1-6 0 3 3 0 0 1 6 0',
 eye:'M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12ZM15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0', cart:'M2 3h3l3 13h11l3-9H6m3 14h1m7 0h1', heart:'M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z',
 check:'m5 12 4 4L19 6', play:'m8 4 13 8-13 8Z', globe:'M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0M2 12h20M12 2c6 6 6 14 0 20-6-6-6-14 0-20', expand:'M8 3H3v5m13-5h5v5M3 16v5h5m8 0h5v-5', mail:'M3 5h18v14H3Zm0 0 9 8 9-8', trash:'M4 6h16M9 6V3h6v3M6 6l1 15h10l1-15M10 10v7m4-7v7', info:'M12 11v6m0-10v1M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0', menu:'M4 6h16M4 12h16M4 18h16', briefcase:'M3 7h18v14H3Zm5 0V3h8v4M3 12c6 4 12 4 18 0m-9 0v4'
};
export function icon(name, cls='') { return `<svg class="icon ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${paths[name] || paths.spark}"/></svg>`; }
