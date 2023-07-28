import fs from "fs";
import { runAppleScript } from "run-applescript";

import { getFrontmostApplication } from "@raycast/api";

const getSelectedFinderFiles = async (): Promise<string> => {
  return runAppleScript(`
    tell application "Finder"
      set theSelection to selection
      if theSelection is {} then
        return
      else if (theSelection count) is equal to 1 then
        return the POSIX path of (theSelection as alias)
      else
        set thePaths to {}
        repeat with i from 1 to (theSelection count)
          copy (POSIX path of (item i of theSelection as alias)) to end of thePaths
        end repeat
        return thePaths
      end if
    end tell
  `);
};

export const getSelectedFiles = async (): Promise<string[]> => {
  const selectedFiles: string[] = [];

  let activeApp;
  try {
    activeApp = (await getFrontmostApplication()).name;
  } catch {
    console.log("Couldn't get frontmost application");
  }

  const finderFiles = (await getSelectedFinderFiles()).split(",");
  if (activeApp == "Finder") {
    selectedFiles.push(...finderFiles);
  } else {
    finderFiles.forEach((filePath) => {
      if (filePath.split("/").at(-2) == "Desktop" && !selectedFiles.includes(filePath)) {
        selectedFiles.push(filePath);
      }
    });
  }

  return selectedFiles;
};

export const moveSelectedFiles = async (destination: string): Promise<string> => {
  const selectedFiles = await getSelectedFiles();
  selectedFiles.forEach((filePath) => {
    fs.renameSync(filePath, `${destination}/${filePath.split("/").at(-1)}`);
  });
  return `${destination}/${selectedFiles[0].split("/").at(-1)}`;
};

export const openPathInFinder = async (path: string) => {
  await runAppleScript(`tell application "Finder" to reveal POSIX file "${path}"`);
};

export const checkIfDirectoryExists = async (directoryPath: string) => {
  const result = await runAppleScript(`
    set directoryPath to "${directoryPath}"

    tell application "System Events"
        set directoryExists to exists folder directoryPath
    end tell

    return directoryExists
  `);
  return result === "true";
};

const stringIsEmpty = (string: string | undefined) => {
  return string?.trim().length === 0 || string === undefined;
};

export const stringOrStringArrayIsEmpty = (value: string | string[] | undefined) => {
  if (!value) {
    return true;
  }
  if (typeof value === "string") {
    return stringIsEmpty(value);
  }
  return value.every((item) => stringIsEmpty(item));
};

export const arrayOfStringsOrStringArraysIsEmpty = (value: (string | string[] | undefined)[] | undefined) => {
  if (!value) {
    return true;
  }
  return value.every((item) => stringOrStringArrayIsEmpty(item));
};
