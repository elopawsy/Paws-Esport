import { MetadataRoute } from 'next';
import { MatchService } from '@/services';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = 'https://pawsesport.com';

    // Get dynamic routes
    const matches = await MatchService.getAllMatches("cs-2");
    const liveMatches = matches.live.map((match) => ({
        url: `${baseUrl}/match/${match.id}`,
        lastModified: new Date(),
        changeFrequency: 'always' as const,
        priority: 0.9,
    }));

    const upcomingMatches = matches.upcoming.map((match) => ({
        url: `${baseUrl}/match/${match.id}`,
        lastModified: new Date(),
        changeFrequency: 'hourly' as const,
        priority: 0.8,
    }));

    const pastMatches = matches.past.slice(0, 50).map((match) => ({
        url: `${baseUrl}/match/${match.id}`,
        lastModified: new Date(match.end_at || new Date()),
        changeFrequency: 'never' as const,
        priority: 0.6,
    }));

    return [
        {
            url: baseUrl,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 1,
        },
        {
            url: `${baseUrl}/tournaments`,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 0.9,
        },
        {
            url: `${baseUrl}/simulator`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.8,
        },
        ...liveMatches,
        ...upcomingMatches,
        ...pastMatches,
    ];
}
