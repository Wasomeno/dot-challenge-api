import { NextApiRequest, NextApiResponse } from "next";
import Cors from "cors";

const couriers = ["jne", "tiki", "pos"];

const cors = Cors({ methods: ["POST", "GET", "HEAD"] });

function runMiddleware(
  req: NextApiRequest,
  res: NextApiResponse,
  fn: Function
) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result: any) => {
      if (result instanceof Error) {
        return reject(result);
      }
      return resolve(result);
    });
  });
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  await runMiddleware(req, res, cors);

  switch (req.method) {
    case "POST":
      const { origin, destination, weight } = await req.body;

      const courierResults = await Promise.all(
        couriers.map((courier) =>
          fetch("https://api.rajaongkir.com/starter/cost", {
            method: "POST",
            headers: {
              key: process.env.API_KEY as string,
              "Content-Type": "application/x-www-form-urlencoded",
            },
            body: new URLSearchParams({
              origin,
              destination,
              weight,
              courier,
            }),
          })
            .then((response) => response.json())
            .then((result) => ({
              origin: result.rajaongkir.origin_details.city_name,
              destination: result.rajaongkir.destination_details.city_name,
              courierCost: result.rajaongkir.results[0],
            }))
        )
      );

      const courierCosts = courierResults.map((courier) => courier.courierCost);

      res.status(200).json({
        origin: courierResults[0].origin,
        destination: courierResults[0].destination,
        courierCosts,
      });

      break;

    default:
      break;
  }
}
