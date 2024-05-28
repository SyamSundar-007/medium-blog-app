import { Hono } from 'hono'
import { PrismaClient } from '@prisma/client/edge'
import { withAccelerate } from '@prisma/extension-accelerate'
import { decode, jwt, sign, verify } from 'hono/jwt'
import { SignatureKey } from 'hono/utils/jwt/jws'
import { JWTPayload } from 'hono/utils/jwt/types'
import {singnupInput, singninInput,createBlogInput,updateBlogInput } from "@syamsundar-007/medium-common-new"
const app = new Hono<{
  Bindings: {
    DATABASE_URL: string
    JWT_SECRET: SignatureKey
  },
  Variables: {
    auth: string
  }
}>()

app.use('/api/v1/blog/*', async (c, next) => {
  const header = c.req.header("Authorization") || "";
  const authheader = header.split(" ")[1]
  console.log(`Auth Header ${authheader}`)
  if (!authheader) {
    c.status(403);
    return c.json({ error: "unauthorized" });
  }

  const response = await verify(authheader, c.env.JWT_SECRET)


  if (response) {
    //@ts-ignore
    c.set("auth", response.id)
    await next()
  }
  else {
    c.status(403)
    return c.json({ error: "unAuthorized" })
  }

})












app.post('/api/v1/signup', async (c) => {
  const body = await c.req.json()



  const{success} = singnupInput.safeParse(body)
  if(!success){
    c.status(403);
    return c.json({ error: "Inputs are invalid" })
  }
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate())

 
  try {
    const user = await prisma.user.create({
      data: {
        email: body.email,
        password: body.password,
      }
    })
    if (!user) {
      c.status(403);
      return c.json({ error: "User is not found" })
    }
    const token = await sign({
      id: user.id
    }, c.env.JWT_SECRET)

    return c.json({
      jwt: token
    })

  } catch (e) {
    c.status(411);
    return c.json({ error: "User is not found" })

  }

}) // route ends here




app.post('/api/v1/signin', async (c) => {

  const body = await c.req.json()
  const{success} = singninInput.safeParse(body)
  if(!success){
    c.status(403);
    return c.json({ error: "Inputs are invalid" })
  }

  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate())



  const user = await prisma.user.findUnique({
    where: {
      email: body.email,
      password: body.password,
    }
  })

  if (!user) {
    c.status(403);
    return c.json({ error: "User is not found" })
  }


  return c.text('signin')

})// route ends here




app.post('/api/v1/blog', async (c) => {

  const body = await c.req.json()
  const{success} = createBlogInput.safeParse(body)
  if(!success){
    c.status(403);
    return c.json({ error: "Inputs are invalid" })
  }

  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate())


  const authorId = c.get("auth");
  console.log(authorId)
  const blog = await prisma.post.create({
    data: {
      title: body.title,
      content: body.content,
      authorId: String(authorId)
    }
  })



  return c.json({
    id:blog.id
  })



}) // route ends here

app.put('/api/v1/blog',async  (c) => {

  const body = await c.req.json()
  const{success} = createBlogInput.safeParse(body)
  if(!success){
    c.status(403);
    return c.json({ error: "Inputs are invalid" })
  }


  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate())

  
  const authorId = c.get("auth");
  const blog = await prisma.post.update({
    where:{
      id:body.id
    },
    data: {
      title: body.title,
      content: body.content
    }
  })



  return c.json({
    id:blog.id
  })

})  //route ends here

app.get('/api/v1/blog/:id',async (c) => {
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate())


  const blogId =  c.req.param('id')
  const blog = await prisma.post.findFirst({
    where:{
      id:blogId
    }
  })



  return c.json({
        blog
  })

}) // route ends here

export default app
