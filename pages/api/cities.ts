import { NextApiRequest, NextApiResponse } from "next";
import Cors from "cors";

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
    case "GET":
      const citiesResult = await fetch(
        "https://api.rajaongkir.com/starter/city",
        {
          method: "GET",
          headers: {
            key: "fb406acbbd2d68580091ae724ae81a76",
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      );

      const cities = await citiesResult.json();

      res.status(200).json(cities);
      break;

    default:
      break;
  }
}
