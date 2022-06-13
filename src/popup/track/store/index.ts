import {trackMutation, Payload} from "./trackMutation";
import { defineStore } from 'pinia';

export const useStore = defineStore('track', {
  actions: {
    async track (payload: Payload){
      return trackMutation(payload)
    }
  }
});