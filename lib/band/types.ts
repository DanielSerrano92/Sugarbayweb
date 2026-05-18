import type { BandMemberType } from "@/app/generated/prisma/client";

export type BandNewsQueryParams = {
  page?: string | string[];
  from?: string | string[];
  to?: string | string[];
  tag?: string | string[];
  news?: string | string[];
};

export type BandNewsFilters = {
  page: number;
  from?: string;
  to?: string;
  tag?: string;
};

export type BandNewsRelatedLink = {
  label: string;
  href: string;
};

export type BandNewsItemView = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  content: string;
  publishedAtIso: string;
  imageUrl: string | null;
  tags: string[];
  relatedLinks: BandNewsRelatedLink[];
};

export type BandNewsCatalogResult = {
  filters: BandNewsFilters;
  items: BandNewsItemView[];
  totalItems: number;
  totalPages: number;
  pageSize: number;
};

export type BandBiographySectionView = {
  id: string;
  slug: string;
  title: string;
  content: string;
  imageUrl: string | null;
  anchorId: string;
};

export type BandMemberLink = {
  label: string;
  url: string;
};

export type BandMemberView = {
  id: string;
  slug: string;
  name: string;
  roleTitle: string;
  bio: string;
  avatarUrl: string | null;
  memberType: BandMemberType;
  links: BandMemberLink[];
};

export type BandMembersDirectory = {
  bandMembers: BandMemberView[];
  collaborators: BandMemberView[];
};
