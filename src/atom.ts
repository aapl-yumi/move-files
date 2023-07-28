import fs from "fs";
import { atom } from "jotai";

import { environment } from "@raycast/api";

import { Destination, DestinationSchema } from "./types";

const DESTINATION_FILE = `${environment.supportPath}/atom.json`;

const readFromFile = (): Destination[] => {
  try {
    const data = fs.readFileSync(DESTINATION_FILE, "utf8");
    if (!data) {
      return [];
    }
    return JSON.parse(data) as Destination[];
  } catch (e) {
    fs.mkdirSync(environment.supportPath, { recursive: true });
    return [];
  }
};

const destinations = atom<Destination[]>(readFromFile());
export const destinationsAtom = atom(
  (get) => get(destinations),
  (_get, set, update: Destination[]) => {
    update.forEach((d) => {
      console.info("Validating destination", d);
      if (!DestinationSchema.safeParse(d).success) {
        console.error("Invalid destination", d);
        throw new Error("Invalid destination");
      }
    });
    set(destinations, update);
    fs.writeFileSync(DESTINATION_FILE, JSON.stringify(update));
  }
);
