import { useAtom } from "jotai";

import { Action, ActionPanel, closeMainWindow, Icon, List } from "@raycast/api";

import { destinationsAtom } from "./atom";
import { moveSelectedFiles, openPathInFinder } from "./utils";

export default function Command() {
  const [destinations, setDestinations] = useAtom(destinationsAtom);

  return (
    <List>
      {destinations.map((destination) => (
        <List.Item
          key={destination.id}
          title={destination.title}
          accessories={[
            {
              text: `${destination.destination}`,
              icon: Icon.Folder,
            },
          ]}
          actions={
            <ActionPanel>
              <Action
                title="Move Selected Files"
                icon={Icon.ArrowRight}
                shortcut={{ modifiers: ["cmd"], key: "m" }}
                onAction={async () => {
                  const newFilePath = await moveSelectedFiles(destination.destination);
                  openPathInFinder(newFilePath);
                  return closeMainWindow();
                }}
              />
              <Action.Open
                title="Open in Finder"
                icon={Icon.Finder}
                target={`file://${destination.destination}`}
                shortcut={{ modifiers: ["cmd", "shift"], key: "o" }}
              />
              <Action
                title="Remove From List"
                icon={Icon.Trash}
                style={Action.Style.Destructive}
                shortcut={{
                  modifiers: ["ctrl"],
                  key: "x",
                }}
                onAction={() => {
                  const newDestinations = destinations.filter((d) => d.destination != destination.destination);
                  setDestinations(newDestinations);
                }}
              />
            </ActionPanel>
          }
        />
      ))}
    </List>
  );
}
