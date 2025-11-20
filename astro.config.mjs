import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import icon from 'astro-icon';
import tailwindcss from '@tailwindcss/vite';
import githubProjects from './github_projects.config';

const githubProjectsRedirects = {};
for (let gp of githubProjects) {
    githubProjectsRedirects[`/github/${gp}`] =
        `https://github.com/alirostami1/${gp}`;
    githubProjectsRedirects[`/g/${gp}`] =
        `https://github.com/alirostami1/${gp}`;
}

// https://astro.build/config
export default defineConfig({
    site: 'https://alirostami.net',
    integrations: [mdx(), sitemap(), icon()],
    vite: {
        plugins: [tailwindcss()],
    },
    markdown: {
        shikiConfig: {
            themes: {
                light: 'github-light',
                dark: 'github-dark',
            },
        },
    },
    redirects: {
        '/github': 'https://github.com/alirostami1/',
        '/linkedin': 'https://www.linkedin.com/in/alirostami1/',
        '/feed': 'https://alirostami.net/feed.xml',
        ...githubProjectsRedirects,
    },
});
