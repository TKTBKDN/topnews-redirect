import Head from "next/head";
import React from "react";
import { GetStaticProps } from "next";
import { domain } from "../domain";

// ISR: Static generation with daily revalidation
// Index page metadata rarely changes, so we cache for 24 hours
export const getStaticProps: GetStaticProps = async () => {
  // Return hardcoded metadata for your domain
  // This avoids external fetch on every build
  return {
    props: {
      url: domain,
      title: "Top News US",
      description: "Latest news and updates",
      icon: "/favicon.ico",
      image: `${domain}/og-image.png`,
    },
    revalidate: 86400, // Revalidate once per day (24 hours)
  };
};

export default function Home({ url, title, description, icon, image }: any) {

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="og:title" content={title} />
        <meta name="og:description" content={description} />
        <meta name="og:image" content={image} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href={icon} />
      </Head>
    </>
  );
}
