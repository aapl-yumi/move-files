import { useAtom } from "jotai";
import { useEffect, useState } from "react";

import { Action, ActionPanel, closeMainWindow, Form, popToRoot, showHUD } from "@raycast/api";

import { destinationsAtom } from "./atom";
import { Destination, DestinationSchema } from "./types";
import { arrayOfStringsOrStringArraysIsEmpty } from "./utils";

const TITLE_EMPTY_ERROR_MESSAGE = "Please enter a title";
const TITLE_EXISTS_ERROR_MESSAGE = "Destination with this title already exists";
const DIRECTORY_EMPTY_ERROR_MESSAGE = "Please select a directory";

export default function Command() {
  const [destinations, setDestinations] = useAtom(destinationsAtom);
  const [formData, setFormData] = useState<Destination>(DestinationSchema.parse({}));

  const checkIfTitleExists = () => {
    const existingDestination = destinations.find((destination) => destination.title == formData.title);
    if (existingDestination) {
      console.log("Existing destination");
      if (arrayOfStringsOrStringArraysIsEmpty([formData.destination, formData.fileTypes, formData.fileRegex])) {
        setFormData(existingDestination);
      } else {
        setError({ ...error, title: TITLE_EXISTS_ERROR_MESSAGE });
      }
    }
    if (formData.title.length > 0) {
      setError({ ...error, title: undefined });
    }
  };
  useEffect(() => {
    checkIfTitleExists();
  }, [formData.title]);
  useEffect(() => {
    if (formData.destination?.length > 0) {
      setError({ ...error, directory: undefined });
    }
  }, [formData.destination]);

  const [error, setError] = useState<{
    [key: string]: string | undefined;
  }>({
    destination: undefined,
    title: undefined,
  });

  const addDestination = async () => {
    const existingDestination = destinations.find((destination) => destination.id == formData.id);
    if (existingDestination) {
      const newDestinations = destinations.filter((destination) => destination.id != formData.id);
      setDestinations([...newDestinations, formData]);
    } else {
      setDestinations([...destinations, formData]);
    }
    await showHUD(`Added destination "${formData.title}"`);
    await popToRoot();
    await closeMainWindow();
  };

  return (
    <Form
      enableDrafts
      actions={
        <ActionPanel>
          <Action.SubmitForm onSubmit={addDestination} />
        </ActionPanel>
      }
    >
      <Form.TextField
        id="title"
        title="Destination Title"
        placeholder="Enter destination title"
        value={formData.title}
        error={error.title}
        onChange={(title) => {
          setFormData({
            ...formData,
            title,
          });
          if (title.length > 0) {
            setError({ ...error, title: undefined });
          }
        }}
        onBlur={(e) => {
          const title = e.target.value;
          checkIfTitleExists();
          if (title?.length == 0) {
            setError({ ...error, title: TITLE_EMPTY_ERROR_MESSAGE });
          }
        }}
      />
      <Form.FilePicker
        id="destination"
        title="Directory"
        value={formData.destination == "" ? undefined : [formData.destination]}
        allowMultipleSelection={false}
        canChooseDirectories
        canChooseFiles={false}
        error={error.directory}
        onChange={(files) => {
          const file = files[0];
          if (file) {
            setError({ ...error, directory: undefined });
            if (formData.title.length > 0) {
              setFormData({
                ...formData,
                destination: file,
              });
            } else {
              setFormData({
                ...formData,
                title: file.split("/").at(-1) || "",
              });
            }
          }
        }}
        onBlur={(e) => {
          if (e.target.value?.length == 0) {
            setError({ ...error, directory: DIRECTORY_EMPTY_ERROR_MESSAGE });
          }
        }}
      />
      <Form.Separator />
      <Form.Description
        title="File Types"
        text="Use this directory when the selected files match the selected file types."
      />
      <Form.TagPicker
        id="fileTypes"
        title=""
        placeholder="Select file types"
        value={formData.fileTypes}
        onChange={(fileTypes) => {
          setFormData({
            ...formData,
            fileTypes,
          });
        }}
      >
        {fileTypes.map((fileType) => (
          <Form.TagPicker.Item key={fileType} title={fileType} value={fileType} />
        ))}
      </Form.TagPicker>
      <Form.Separator />
      <Form.Description
        title="Custom Regex"
        text="If you enter a custom regex, it will be used instead of the selected file types."
      />
      <Form.TextField
        id="fileRegex"
        title=""
        placeholder="Enter custom regex"
        value={formData.fileRegex}
        onChange={(fileRegex) => {
          setFormData({
            ...formData,
            fileRegex,
          });
        }}
      />
    </Form>
  );
}

const fileTypes = [
  "png",
  "jpg",
  "jpeg",
  "gif",
  "pdf",
  "txt",
  "md",
  "doc",
  "docx",
  "xls",
  "xlsx",
  "ppt",
  "pptx",
  "mp3",
  "m4a",
  "wav",
  "mp4",
  "mov",
  "m4v",
  "avi",
  "mkv",
  "mpg",
  "wmv",
  "zip",
  "tar",
  "gz",
  "bz2",
  "7z",
  "pdf",
  "html",
  "js",
  "css",
];
