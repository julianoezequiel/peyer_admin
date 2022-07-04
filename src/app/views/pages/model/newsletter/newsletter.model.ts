export interface Newsletter {
  _id: string;
  title: string;
  description: string;
  messageBody: string;
  attachments: FileStructure[];
  publicationDate: string;
  author: {
    uid: string;
    displayName: string;
  };
}

export interface FileStructure {
  id: string;
  name: string;
  type: string;
}
