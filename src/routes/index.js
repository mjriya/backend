import ArticleRouter from "./article.route.js";
import AuthRouter from "./user.router.js"
import AdminRouter from "./admin.route.js"
import UserRouter from "./user.router.js"
import Category from "./category.route.js"
import Tag from "./tag.route.js"
import RssRoute from "./rss.route.js"
import Notification from "./notification.route.js"
import LayoutStructure from "./layoutStructure.route.js"
import Img from "./img.route.js"
import Series from "./series.route.js"

const initRoutes = (app) => {
    app.use("/", ArticleRouter);
    app.use("/media", Img);
    app.use("/auth", AuthRouter);
    app.use("/admin", AdminRouter);
    app.use("/user", UserRouter)
    app.use("/categories", Category)
    app.use("/rss", RssRoute)
    app.use("/notification",Notification )
    app.use("/structure",LayoutStructure )
    app.use("/series",Series )
    
    

    app.get("/", async (req, res) => {
        res.json({
            "message": "Welcome to  Developers Portal"
        })
    })

    app.use("*", (req, res) => {
        res.status(404).json({
            "status": 404,
            "message": "Invalid route"
        })
    })
}

export {
    initRoutes
}
