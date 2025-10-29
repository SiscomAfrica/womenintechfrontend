import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function ButtonShowcase() {
  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Button Variants Showcase</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-gray-900">Primary Buttons</h3>
          <div className="flex flex-wrap gap-3">
            <Button variant="default" size="sm">Small Primary</Button>
            <Button variant="default">Default Primary</Button>
            <Button variant="default" size="lg">Large Primary</Button>
            <Button variant="default" disabled>Disabled Primary</Button>
          </div>
        </div>

        {}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-gray-900">Outline Buttons</h3>
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" size="sm">Small Outline</Button>
            <Button variant="outline">Default Outline</Button>
            <Button variant="outline" size="lg">Large Outline</Button>
            <Button variant="outline" disabled>Disabled Outline</Button>
          </div>
        </div>

        {}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-gray-900">Ghost Buttons</h3>
          <div className="flex flex-wrap gap-3">
            <Button variant="ghost" size="sm">Small Ghost</Button>
            <Button variant="ghost">Default Ghost</Button>
            <Button variant="ghost" size="lg">Large Ghost</Button>
            <Button variant="ghost" disabled>Disabled Ghost</Button>
          </div>
        </div>

        {}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-gray-900">Background Tests</h3>
          
          {}
          <div className="p-4 bg-white border rounded-lg">
            <p className="text-sm text-gray-600 mb-3">White Background</p>
            <div className="flex flex-wrap gap-2">
              <Button variant="default">Primary</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
            </div>
          </div>

          {}
          <div className="p-4 bg-gray-50 border rounded-lg">
            <p className="text-sm text-gray-600 mb-3">Light Gray Background</p>
            <div className="flex flex-wrap gap-2">
              <Button variant="default">Primary</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
            </div>
          </div>

          {}
          <div className="p-4 bg-blue-50 border rounded-lg">
            <p className="text-sm text-gray-600 mb-3">Blue Background</p>
            <div className="flex flex-wrap gap-2">
              <Button variant="default">Primary</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}