.class public Lcom/shotbomba/outbreak/HzRun;
.super Ljava/lang/Object;
.implements Ljava/lang/Runnable;

.field private final act:Landroid/app/Activity;
.field private final hz:F

.method public constructor <init>(Landroid/app/Activity;F)V
    .locals 0
    invoke-direct {p0}, Ljava/lang/Object;-><init>()V
    iput-object p1, p0, Lcom/shotbomba/outbreak/HzRun;->act:Landroid/app/Activity;
    iput p2, p0, Lcom/shotbomba/outbreak/HzRun;->hz:F
    return-void
.end method

.method public run()V
    .locals 3
    :try_start_0
    iget-object v0, p0, Lcom/shotbomba/outbreak/HzRun;->act:Landroid/app/Activity;
    invoke-virtual {v0}, Landroid/app/Activity;->getWindow()Landroid/view/Window;
    move-result-object v0
    invoke-virtual {v0}, Landroid/view/Window;->getAttributes()Landroid/view/WindowManager$LayoutParams;
    move-result-object v1
    iget v2, p0, Lcom/shotbomba/outbreak/HzRun;->hz:F
    iput v2, v1, Landroid/view/WindowManager$LayoutParams;->preferredRefreshRate:F
    invoke-virtual {v0, v1}, Landroid/view/Window;->setAttributes(Landroid/view/WindowManager$LayoutParams;)V
    :try_end_0
    .catch Ljava/lang/Exception; {:try_start_0 .. :try_end_0} :catch_0
    :catch_0
    return-void
.end method
