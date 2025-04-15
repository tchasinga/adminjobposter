import { Button } from "./components/ui/button";


export default function Home() {
  return (
    <div className="">
      <h1 className="text-3xl font-bold underline">
        Hello world!
      </h1>
      <Button variant="outline">Hello</Button>
      <Button variant="default">Hello</Button>
      <Button variant="destructive">Hello</Button>
      <Button variant="secondary">Hello</Button>
      <Button variant="ghost">Hello</Button>
      <Button variant="link">Hello</Button>
    </div>
  );
}
