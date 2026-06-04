import { defaultWebsiteMedia } from "../data/websiteMedia.js";
import { apiRequest } from "./api.js";

export async function fetchWebsiteMedia() {
  try {
    return await apiRequest("/website-media");
  } catch {
    return defaultWebsiteMedia;
  }
}

export function fetchAllWebsiteMedia() {
  return apiRequest("/website-media/all");
}

export function fetchWebsiteMediaSection(sectionKey) {
  return apiRequest(`/website-media/${encodeURIComponent(sectionKey)}`);
}

export function saveWebsiteMedia(item) {
  return apiRequest(item.id ? `/website-media/${item.id}` : "/website-media", {
    method: item.id ? "PUT" : "POST",
    body: JSON.stringify(item),
  });
}

export function deleteWebsiteMedia(id) {
  return apiRequest(`/website-media/${id}`, { method: "DELETE" });
}
