const crypto = require("crypto");
const https = require("https");

const AMAZON_HOST = process.env.AMAZON_PAAPI_HOST?.trim();
const AMAZON_REGION = process.env.AMAZON_PAAPI_REGION?.trim();
const AMAZON_MARKETPLACE = process.env.AMAZON_PAAPI_MARKETPLACE?.trim();
const AMAZON_ACCESS_KEY = process.env.AMAZON_PAAPI_ACCESS_KEY?.trim();
const AMAZON_SECRET_KEY = process.env.AMAZON_PAAPI_SECRET_KEY?.trim();
const AMAZON_PARTNER_TAG = process.env.AMAZON_PAAPI_PARTNER_TAG?.trim();

const RESOURCE_NAMES = [
  "Images.Primary.Large",
  "ItemInfo.Title",
  "ItemInfo.Features",
  "Offers.Listings.Price",
  "BrowseNodeInfo.WebsiteSalesRank",
];

const getRequiredConfig = () => {
  const missingKeys = [
    ["AMAZON_PAAPI_HOST", AMAZON_HOST],
    ["AMAZON_PAAPI_REGION", AMAZON_REGION],
    ["AMAZON_PAAPI_MARKETPLACE", AMAZON_MARKETPLACE],
    ["AMAZON_PAAPI_ACCESS_KEY", AMAZON_ACCESS_KEY],
    ["AMAZON_PAAPI_SECRET_KEY", AMAZON_SECRET_KEY],
    ["AMAZON_PAAPI_PARTNER_TAG", AMAZON_PARTNER_TAG],
  ].filter(([, value]) => !value);

  if (missingKeys.length) {
    throw new Error(
      `Amazon API is not configured. Missing: ${missingKeys
        .map(([key]) => key)
        .join(", ")}`,
    );
  }

  return {
    host: AMAZON_HOST,
    region: AMAZON_REGION,
    marketplace: AMAZON_MARKETPLACE,
    accessKey: AMAZON_ACCESS_KEY,
    secretKey: AMAZON_SECRET_KEY,
    partnerTag: AMAZON_PARTNER_TAG,
  };
};

const extractAsinFromUrl = (url) => {
  const patterns = [
    /\/dp\/([A-Z0-9]{10})(?:[/?]|$)/i,
    /\/gp\/product\/([A-Z0-9]{10})(?:[/?]|$)/i,
    /\/product\/([A-Z0-9]{10})(?:[/?]|$)/i,
    /[?&]asin=([A-Z0-9]{10})(?:[&#]|$)/i,
    /\/([A-Z0-9]{10})(?:[/?]|$)/i,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);

    if (match?.[1]) {
      return match[1].toUpperCase();
    }
  }

  return null;
};

const hmac = (key, value, encoding) =>
  crypto.createHmac("sha256", key).update(value, "utf8").digest(encoding);

const getSignatureKey = (secretKey, datestamp, regionName, serviceName) => {
  const kDate = hmac(`AWS4${secretKey}`, datestamp);
  const kRegion = hmac(kDate, regionName);
  const kService = hmac(kRegion, serviceName);
  return hmac(kService, "aws4_request");
};

const signRequest = ({ accessKey, secretKey, region, host, payload }) => {
  const now = new Date();
  const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, "");
  const dateStamp = amzDate.slice(0, 8);
  const canonicalUri = "/paapi5/getitems";
  const canonicalHeaders =
    `content-encoding:amz-1.0\n` +
    `content-type:application/json; charset=utf-8\n` +
    `host:${host}\n` +
    `x-amz-date:${amzDate}\n` +
    `x-amz-target:com.amazon.paapi5.v1.ProductAdvertisingAPIv1.GetItems\n`;
  const signedHeaders =
    "content-encoding;content-type;host;x-amz-date;x-amz-target";
  const payloadHash = crypto.createHash("sha256").update(payload).digest("hex");
  const canonicalRequest = [
    "POST",
    canonicalUri,
    "",
    canonicalHeaders,
    signedHeaders,
    payloadHash,
  ].join("\n");
  const algorithm = "AWS4-HMAC-SHA256";
  const credentialScope = `${dateStamp}/${region}/ProductAdvertisingAPI/aws4_request`;
  const stringToSign = [
    algorithm,
    amzDate,
    credentialScope,
    crypto.createHash("sha256").update(canonicalRequest).digest("hex"),
  ].join("\n");
  const signingKey = getSignatureKey(
    secretKey,
    dateStamp,
    region,
    "ProductAdvertisingAPI",
  );
  const signature = crypto
    .createHmac("sha256", signingKey)
    .update(stringToSign, "utf8")
    .digest("hex");

  return {
    amzDate,
    authorization:
      `${algorithm} Credential=${accessKey}/${credentialScope}, ` +
      `SignedHeaders=${signedHeaders}, Signature=${signature}`,
  };
};

const postJson = (host, path, headers, body) =>
  new Promise((resolve, reject) => {
    const request = https.request(
      {
        hostname: host,
        path,
        method: "POST",
        headers,
      },
      (response) => {
        let responseBody = "";

        response.setEncoding("utf8");
        response.on("data", (chunk) => {
          responseBody += chunk;
        });
        response.on("end", () => {
          let parsedBody = {};

          if (responseBody) {
            try {
              parsedBody = JSON.parse(responseBody);
            } catch (error) {
              reject(new Error("Amazon returned an unreadable response"));
              return;
            }
          }

          resolve({
            ok:
              typeof response.statusCode === "number" &&
              response.statusCode >= 200 &&
              response.statusCode < 300,
            statusCode: response.statusCode,
            data: parsedBody,
          });
        });
      },
    );

    request.on("error", (error) => {
      reject(error);
    });
    request.write(body);
    request.end();
  });

const mapAmazonItemToProduct = ({ item, affiliateLink, asin }) => {
  const features = item?.ItemInfo?.Features?.DisplayValues || [];
  const title = item?.ItemInfo?.Title?.DisplayValue || `Amazon product ${asin}`;
  const imageUrl = item?.Images?.Primary?.Large?.URL || "";
  const priceAmount = item?.Offers?.Listings?.[0]?.Price?.Amount;
  const displayPrice = item?.Offers?.Listings?.[0]?.Price?.DisplayAmount;
  const salesRank = item?.BrowseNodeInfo?.WebsiteSalesRank?.SalesRank;
  const descriptionLines = [];

  if (features.length) {
    descriptionLines.push(features.slice(0, 3).join(" "));
  }

  if (displayPrice) {
    descriptionLines.push(`Amazon listed price: ${displayPrice}.`);
  }

  if (salesRank) {
    descriptionLines.push(`Amazon best sellers rank: #${salesRank}.`);
  }

  return {
    title,
    description: descriptionLines.join(" ").trim(),
    category: "Amazon",
    price: Number.isFinite(priceAmount) ? priceAmount : 0,
    affiliateLink,
    images: imageUrl ? [imageUrl] : [],
    features,
    pros: [],
    cons: [],
    rating: 0,
  };
};

const fetchAmazonProduct = async (affiliateLink) => {
  const config = getRequiredConfig();
  const asin = extractAsinFromUrl(affiliateLink);

  if (!asin) {
    throw new Error("Could not extract an Amazon ASIN from the provided link");
  }

  const payload = JSON.stringify({
    ItemIds: [asin],
    ItemIdType: "ASIN",
    Marketplace: config.marketplace,
    PartnerTag: config.partnerTag,
    PartnerType: "Associates",
    Resources: RESOURCE_NAMES,
  });
  const signature = signRequest({
    accessKey: config.accessKey,
    secretKey: config.secretKey,
    region: config.region,
    host: config.host,
    payload,
  });
  const response = await postJson(
    config.host,
    "/paapi5/getitems",
    {
      "content-encoding": "amz-1.0",
      "content-type": "application/json; charset=utf-8",
      host: config.host,
      "x-amz-date": signature.amzDate,
      "x-amz-target": "com.amazon.paapi5.v1.ProductAdvertisingAPIv1.GetItems",
      authorization: signature.authorization,
      "content-length": Buffer.byteLength(payload),
    },
    payload,
  );
  const data = response.data;

  if (!response.ok) {
    const message =
      data?.Errors?.[0]?.Message ||
      data?.__type ||
      "Amazon product lookup failed";
    throw new Error(message);
  }

  if (data?.Errors?.length) {
    throw new Error(data.Errors[0].Message || "Amazon product lookup failed");
  }

  const item = data?.ItemsResult?.Items?.[0];

  if (!item) {
    throw new Error("Amazon did not return a product for this link");
  }

  return mapAmazonItemToProduct({ item, affiliateLink, asin });
};

module.exports = {
  fetchAmazonProduct,
  extractAsinFromUrl,
};
