import Link from "next/link";
import {
  LineItemContainer,
  LineItemHeading,
  LineItemOuterContainer,
  LineItemSubheading,
} from "../line-item";

export default function Page() {
  return (
    <LineItemOuterContainer>
      <LineItemContainer>
        <LineItemHeading>
          <Link href="/chat">𝐹𝒶𝓈𝓉 Chat</Link>
        </LineItemHeading>
        <LineItemSubheading>Server-driven markdown parsing</LineItemSubheading>
      </LineItemContainer>

      <LineItemContainer>
        <LineItemHeading>
          <Link href="/dict">𝒻𝒶𝓈𝓉 Dictionary</Link>
        </LineItemHeading>
        <LineItemSubheading>
          High-performance AI-powered dictionary that works even without
          JavaScript
        </LineItemSubheading>
      </LineItemContainer>
    </LineItemOuterContainer>
  );
}
