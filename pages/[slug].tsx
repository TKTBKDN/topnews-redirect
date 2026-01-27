import Head from "next/head";
import React from "react";
import { GetStaticProps, GetStaticPaths } from "next";

// Helper function to fetch with timeout
async function fetchWithTimeout(url: string, timeoutMs: number = 3000): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
    });
    return response;
  } finally {
    clearTimeout(timeoutId);
  }
}

// Helper function to fetch backup data from JSON file (R2 CDN)
async function fetchBackupData(id: string): Promise<{ name: string; avatarLink: string } | null> {
  try {
    const backupUrl = `https://file.lifenews247.com/sportnews/backup/${id}.json`;
    const response = await fetch(backupUrl);

    if (!response.ok) {
      console.error(`Backup fetch failed with status: ${response.status}`);
      return null;
    }

    const backupData = await response.json();

    return {
      name: backupData.name || '',
      avatarLink: backupData.avatarLink || '',
    };
  } catch (error) {
    console.error('Error fetching backup data:', error);
    return null;
  }
}

// ISR: Pre-render pages at build time and cache
export const getStaticPaths: GetStaticPaths = async () => {
  return {
    paths: [],
    fallback: 'blocking',
  };
};

// Only Facebook crawlers reach here (regular users are redirected by next.config.js)
export const getStaticProps: GetStaticProps = async (context) => {
  const slug = context.params?.slug as string;

  // Extract ID from slug (format: p-title-123)
  const id = slug?.slice(slug?.lastIndexOf("-") + 1);

  try {
    // 1. Try fetching from API with 3 second timeout
    const response = await fetchWithTimeout(
      `${process.env.APP_API}/News/news-detailbasic?id=${id}`,
      3000
    );

    if (response.ok) {
      const { data } = await response.json();

      // Check if data has valid name property
      if (data && data.name && data.name.trim() !== '') {
        return {
          props: data,
          revalidate: 86400, // Revalidate every 24 hours
        };
      }
    }

    // 2. API failed or no valid name, try backup JSON
    console.log(`API did not return valid name for id: ${id}, trying backup...`);

  } catch (error) {
    // Timeout or network error
    if (error instanceof Error && error.name === 'AbortError') {
      console.log(`API timeout (3s) for id: ${id}, trying backup...`);
    } else {
      console.error('Error fetching from API:', error);
    }
  }

  // 3. Fallback to backup JSON
  const backupData = await fetchBackupData(id);

  if (backupData && backupData.name && backupData.name.trim() !== '') {
    return {
      props: backupData,
      revalidate: 86400,
    };
  }

  // Both API and backup failed
  return {
    props: { name: '', avatarLink: '' },
    revalidate: 3600, // Retry after 1 hour
  };
};

export default function App({ name, avatarLink }: any) {
  return (
    <>
      <Head>
        <title>{name}</title>
        <meta property="og:title" content={name} />
        <meta property="og:description" content={name} />
        <meta property="og:image" content={avatarLink} />
        <meta property="og:type" content="article" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
    </>
  );
}
