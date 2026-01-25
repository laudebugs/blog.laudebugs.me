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
                    link: 'https://journal.laudebugs.me',
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
            google: 'Sedan',
        },
        mono: {
            google: 'Google Sans Code'
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
            fontFamily: {
                // mono: "IBM Plex Mono",
            },
            fontWeight: {
                regular: '400',
            },
        },
    },
})
