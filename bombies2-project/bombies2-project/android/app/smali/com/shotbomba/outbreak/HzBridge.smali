.class public Lcom/shotbomba/outbreak/HzBridge;
.super Ljava/lang/Object;

.field private final act:Landroid/app/Activity;

.method public constructor <init>(Landroid/app/Activity;)V
    .locals 0
    invoke-direct {p0}, Ljava/lang/Object;-><init>()V
    iput-object p1, p0, Lcom/shotbomba/outbreak/HzBridge;->act:Landroid/app/Activity;
    return-void
.end method

.method public setHz(F)V
    .locals 2
    .annotation runtime Landroid/webkit/JavascriptInterface;
    .end annotation
    new-instance v0, Lcom/shotbomba/outbreak/HzRun;
    iget-object v1, p0, Lcom/shotbomba/outbreak/HzBridge;->act:Landroid/app/Activity;
    invoke-direct {v0, v1, p1}, Lcom/shotbomba/outbreak/HzRun;-><init>(Landroid/app/Activity;F)V
    invoke-virtual {v1, v0}, Landroid/app/Activity;->runOnUiThread(Ljava/lang/Runnable;)V
    return-void
.end method
