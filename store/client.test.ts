import { describe, expect, it, beforeEach } from "vitest";
import { setActivePinia, createPinia } from "pinia";
import { useClientStore } from "~/store/client";
import type { User } from "~/types";

describe("client store", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it("initial state has empty user", () => {
    const store = useClientStore();
    expect(store.getUser()).toEqual({});
  });

  it("setUser and getUser", () => {
    const store = useClientStore();
    const user: User = {
      login: "user1",
      id: 1,
      node_id: "n1",
      avatar_url: "",
      gravatar_id: "",
      url: "",
      html_url: "",
      followers_url: "",
      following_url: "",
      gists_url: "",
      starred_url: "",
      subscriptions_url: "",
      organizations_url: "",
      repos_url: "",
      events_url: "",
      received_events_url: "",
      type: "User",
      site_admin: false,
      name: "User One",
      company: "",
      blog: "",
      location: null,
      email: "a@b.com",
      hireable: null,
      bio: "",
      twitter_username: null,
      public_repos: 0,
      public_gists: 0,
      followers: 0,
      following: 0,
      created_at: "",
      updated_at: "",
    };
    store.setUser(user);
    expect(store.getUser()).toEqual(user);
  });
});
