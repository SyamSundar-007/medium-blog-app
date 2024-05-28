import z  from "zod";

export const singnupInput = z.object({
  email:z.string().email(),
  password:z.string().min(8),
  name:z.string().optional()
})


// type of signup input

export type SingnupInput = z.infer<typeof singnupInput>


export const singninInput = z.object({
    email:z.string().email(),
    password:z.string().min(8)
  })
  
  // type of signin input
  
  export type SingninInput = z.infer<typeof singninInput>




  export const createBlogInput = z.object({
    title:z.string(),
    content:z.string(),
  })
  
  
  // type of createBlog input
  export type CreateBlogInput = z.infer<typeof createBlogInput>



  export const updateBlogInput = z.object({
    title:z.string(),
    content:z.string(),
    id:z.string()
  })
  
  
  // type of createBlog input
  export type UpdateBlogInput = z.infer<typeof updateBlogInput>