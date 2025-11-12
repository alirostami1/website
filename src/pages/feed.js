import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';

export async function GET(context) {
    const blog = await getCollection('blog');
    return rss({
        title: "Ali Rostami's Blog",
        description: 'A Programmer Prespective of the World',
        site: context.site,
        items: blog.map((post) => ({
            title: post.data.title,
            author: 'Ali Rostami',
            pubDate: post.data.pubDate,
            description: post.data.description,
            customData: post.data.customData,
            link: `/blog/${post.id}/`,
        })),
    });
}
