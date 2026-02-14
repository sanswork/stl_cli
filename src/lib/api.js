/**
 * JSON:API client for StartTheLanding.
 */

export function createClient(server, apiKey) {
  const baseUrl = server.replace(/\/+$/, "") + "/api/json";

  async function request(method, path, body) {
    const url = baseUrl + path;
    const headers = {
      Authorization: `Bearer ${apiKey}`,
      Accept: "application/vnd.api+json",
    };

    const opts = { method, headers };

    if (body) {
      headers["Content-Type"] = "application/vnd.api+json";
      opts.body = JSON.stringify(body);
    }

    const res = await fetch(url, opts);

    if (!res.ok) {
      let detail = "";
      try {
        const err = await res.json();
        detail =
          err.errors?.map((e) => e.detail || e.title).join(", ") ||
          JSON.stringify(err);
      } catch {
        detail = await res.text();
      }
      throw new Error(`${method} ${path} failed (${res.status}): ${detail}`);
    }

    if (res.status === 204) return null;
    return res.json();
  }

  return {
    // Domains
    async listDomains() {
      const data = await request("GET", "/domains");
      return data.data;
    },

    async getDomainByName(name) {
      const data = await request(
        "GET",
        `/domains?filter[domain]=${encodeURIComponent(name)}`
      );
      return data.data?.[0] || null;
    },

    // Pages
    async listPages(domainId) {
      const data = await request(
        "GET",
        `/pages?filter[domain_id]=${encodeURIComponent(domainId)}`
      );
      return data.data;
    },

    async getPage(id) {
      const data = await request("GET", `/pages/${id}`);
      return data.data;
    },

    async updatePage(id, attributes) {
      const data = await request("PATCH", `/pages/${id}`, {
        data: {
          type: "page",
          id,
          attributes,
        },
      });
      return data.data;
    },

    async publishPage(id) {
      const data = await request("PATCH", `/pages/${id}/publish`, {
        data: {
          type: "page",
          id,
          attributes: {},
        },
      });
      return data.data;
    },
  };
}
