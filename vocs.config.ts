import { defineConfig } from 'vocs'
import { formatTagsForSideNav, getPostsByYear } from './docs/helpers/get-tagged-posts.js'

export default defineConfig({
    title: "Bugasu's Technical Blog",
    // disable ai call to action for now
    aiCta: false, 
    /** The base of the documentation directory */
    rootDir: 'docs',
    sidebar: {
        '/posts/': [
            {
                text: 'Topics',
                items: formatTagsForSideNav(),
            },
            {
                text: 'Archive',
                items: getPostsByYear(),
            },
        ],
        '/archive': [
            {
                text: 'Archive',
                items: getPostsByYear(),
            },
        ]
    },
    editLink: {
        pattern: 'https://github.com/laudebugs/blog.laudebugs.me/edit/main/docs/pages/:path',
        text: 'Suggest changes to this page',
    },
    topNav: [
        { text: 'Home', link: '/', match: '/' },
        { text: 'Archive', link: '/archive', match: '/archive' },
        { text: 'Personal Website', link: 'https://www.laudebugs.me' },
        {
            text: 'More Links',
            items: [
                {
                    text: 'Dev Journal',
                    link: 'https://journal.laudebugs.net',
                },
                {
                    text: 'Imperfect Place',
                    link: 'https://imperfect.place',
                },
            ],
        },
    ],
    socials: [
        {
            icon: 'github',
            link: 'https://github.com/laudebugs',
        },
        {
            icon: 'bluesky',
            link: 'https://bsky.app/profile/laudebugs.me',
        },
        {
            icon: 'x',
            link: 'https://twitter.com/laudebugs',
        },
    ],
    iconUrl: {
        light: '/assets/logo.svg',
        dark: '/assets/logo.svg',
    },
    logoUrl: {
        light: '/assets/logo.svg',
        dark: '/assets/logo.svg',
    },
    blogDir: 'blog',
    font: {
        default: {
            google: 'Crimson Pro',
        },
        mono: {
            google: 'IBM Plex Mono'
        }
    },
    markdown: {
        code: {
            themes: {
                light: 'github-light',
                dark: 'night-owl',
            },
        },
    },
    theme: {
        accentColor: {
            dark: '#907AD6',
            light: '#470FF4',
        },
        variables: {
            fontWeight: {
                regular: '400',
            },
           fontSize: {
      root: '1.05em',
    //   '9': string,
    //   '11': string,
    //   '12': string,
    //   '13': string,
    //   '14': string,
    //   '15': string,
    //   '16': string,
    //   '18': string,
    //   '20': '1.5em',
    //   '24': string,
    //   '32': string,
      h1: '2em',
    //   h2: string,
    //   h3: string,
    //   h4: string,
    //   h5: string,
    //   h6: string,
    //   code: string,
    //   codeBlock: string,
    //   lineNumber: string,
    //   subtitle: string,
    //   th: string,
    //   td: string,
    },
        },
    },
})
