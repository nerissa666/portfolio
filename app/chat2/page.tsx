import { getInitialMessagesReactNode, getMessageReactNode } from "./action";
import ClientPage from "./client-page";

export default async function Page() {
  return (
    <ClientPage
      getMessageReactNode={getMessageReactNode}
      initialMessagesReactNode={await getInitialMessagesReactNode()}
    />
  );
}
