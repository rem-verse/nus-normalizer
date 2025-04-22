import { AwsClient } from "npm:aws4fetch";
import * as BunnySDK from "https://esm.sh/@bunny.net/edgescript-sdk@0.11.2";
import { env } from "node:process";

BunnySDK.net.http.servePullZone({ url: "https://nintendo.cdn.rem-verse.com" })
  .onOriginRequest(
    (ctx: { request: Request }) => {
      const baseUrl = new URL(ctx.request.url.toLowerCase());
      if (baseUrl.pathname.startsWith("/ccs/download/")) {
        baseUrl.pathname = baseUrl.pathname.slice("/ccs/download".length);
      }

      // We need to resign....
      if (ctx.request.url != baseUrl.toString()) {
        const client = new AwsClient({
          "accessKeyId":
            env[
              `${
                baseUrl.host.split(".")[0].replaceAll("-", "_").toUpperCase()
              }_B2_APPLICATION_KEY_ID`
            ]!,
          "secretAccessKey":
            env[
              `${
                baseUrl.host.split(".")[0].replaceAll("-", "_").toUpperCase()
              }_B2_APPLICATION_KEY`
            ]!,
          "service": "s3",
        });

        return client.sign(baseUrl.toString(), {
            method: ctx.request.method,
            headers: {
              host: ctx.request.headers.get('host'),
            },
        // deno-lint-ignore no-explicit-any
        } as any);
      } else {
        return Promise.resolve(ctx.request);
      }
    },
  ).onOriginResponse((ctx: { request: Request; response: Response }) => {
    const response = ctx.response;
    return Promise.resolve(response);
  });
