import Link from 'next/link';
import { Button } from '@/components/ui';

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-12 bg-gray-50">
      <div className="text-center space-y-6 max-w-2xl px-4">
        <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl text-gray-900">
          Architectural Design Assistant
        </h1>
        <p className="text-xl text-gray-600">
          Streamline your architectural workflow. Manage projects, define zoning hierarchies, and plan spaces interactively.
        </p>
        <div className="flex justify-center gap-4">
          <Link href="/projects">
            <Button size="lg">Get Started</Button>
          </Link>
          <Button variant="outline" size="lg">
            Documentation
          </Button>
        </div>
      </div>
    </div>
  );
}
