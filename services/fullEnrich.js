import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const headers = {
  Authorization: `Bearer ${process.env.API_KEY}`,
};

export async function startEnrichment(email) {
  const response = await axios.post(
    "https://app.fullenrich.com/api/v1/contact/reverse/email/bulk",
    {
      name: "Decision Maker Verification",
      webhook_url: `${process.env.BASE_URL}/api/enrich/webhook`,
      data: [{ email }],
    },
    { headers }
  );

  console.log("FullEnrich job started:", response.data);

  return response.data.enrichment_id;
}
