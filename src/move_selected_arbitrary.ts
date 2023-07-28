import { closeMainWindow, LaunchProps, showHUD, showToast, Toast } from "@raycast/api";

import { checkIfDirectoryExists, moveSelectedFiles, openPathInFinder } from "./utils";
import { useAtom } from "jotai";
import { destinationsAtom } from "./atom";

export default async function Command(props: LaunchProps<{ arguments: Arguments.MoveSelectedArbitrary }>) {
  const [destinations] = useAtom(destinationsAtom);
  const { destination } = props.arguments;

  const directoryExists = await checkIfDirectoryExists(destination);

  let destinationDirectory = destination;

  if (!directoryExists) {
    if (!destination.includes("/")) {
      showToast({
        title: "Directory does not exist",
        message: `The directory "${destination}" does not exist.`,
        style: Toast.Style.Failure,
      });
      return;
    }
    const exsistingDirectories = destinations.find((d) => d.title === destination);
    if (exsistingDirectories) {
      destinationDirectory = exsistingDirectories.destination;
    }
  }

  try {
    const newPath = await moveSelectedFiles(destinationDirectory);
    closeMainWindow();
    openPathInFinder(newPath);
    showHUD(`Moved files to ${destinationDirectory}`);
  } catch (error) {
    showToast({
      title: "Error moving files",
      message: `There was an error moving the files: ${error}`,
      style: Toast.Style.Failure,
    });
  }
}
