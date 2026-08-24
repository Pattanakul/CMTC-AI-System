import { createClient } from '@/lib/supabase/server'
import { createCategory, deleteCategory } from '@/app/admin/actions/taxonomy'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default async function CategoriesPage() {
  const supabase = await createClient()
  const { data: categories } = await supabase.from('categories').select('*').order('name')

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">Manage Categories</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-1 h-fit">
          <CardHeader>
            <CardTitle>Add Category</CardTitle>
          </CardHeader>
          <CardContent>
            <form action={createCategory as unknown as (payload: FormData) => void} className="space-y-4">
              <div className="space-y-2">
                <Input name="name" placeholder="Category Name" required />
              </div>
              <div className="space-y-2">
                <Input name="slug" placeholder="category-slug" required />
              </div>
              <Button type="submit" className="w-full">Create</Button>
            </form>
          </CardContent>
        </Card>
        
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Existing Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories?.map((cat) => (
                  <TableRow key={cat.id}>
                    <TableCell className="font-medium">{cat.name}</TableCell>
                    <TableCell>{cat.slug}</TableCell>
                    <TableCell>
                      <form action={async () => {
                        'use server'
                        await deleteCategory(cat.id)
                      }}>
                        <Button variant="destructive" size="sm" type="submit">
                          Delete
                        </Button>
                      </form>
                    </TableCell>
                  </TableRow>
                ))}
                {!categories?.length && (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-muted-foreground">
                      No categories found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
