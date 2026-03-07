import { defineStore } from "pinia";
import type { User } from "~/types";

export const useClientStore = defineStore("client", {
  state: () => ({
    user: {} as User,
  }),
  getters: {},
  actions: {
    setUser(user: User) {
      this.user = user;
    },
    getUser() {
      return this.user;
    },
  },
});
