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

      const costs = await Promise.all(
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
            .then((result) => result.json())
            .then((cost) => cost.rajaongkir.results[0])
        )
      );

      res.status(200).json(costs);

      break;

    default:
      break;
  }
}
