import { closeMainWindow, getPreferenceValues, popToRoot, showHUD, showToast, Toast } from "@raycast/api";
import { getSelectedFiles, moveSelectedFiles, openPathInFinder } from "./utils";

interface Preferences {
  directory_one?: string;
  directory_two?: string;
  directory_three?: string;
}

export default async function moveSelectedNum(num: 1 | 2 | 3) {
  const preferences = getPreferenceValues<Preferences>();

  const getDestination = () => {
    switch (num) {
      case 1:
        return preferences.directory_one;
      case 2:
        return preferences.directory_two;
      case 3:
        return preferences.directory_three;
    }
  };
  const destination = getDestination();

  if (!destination) {
    return await showToast({
      title: "No destination set",
      message: `Please set destination ${num} in preferences`,
      style: Toast.Style.Failure,
    });
  }

  const selectedFiles = await getSelectedFiles();
  if (selectedFiles.length === 0) {
    return await showToast({
      title: "No files selected",
      message: "Please select some files",
      style: Toast.Style.Failure,
    });
  }

  const newPath = await moveSelectedFiles(destination);
  openPathInFinder(newPath);
  popToRoot();
  closeMainWindow();
  showHUD(`Moved ${selectedFiles.length} files to ${destination}`);
}
