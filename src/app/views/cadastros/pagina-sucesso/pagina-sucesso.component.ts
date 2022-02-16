import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";

@Component({
  selector: "app-pagina-sucesso",
  templateUrl: "./pagina-sucesso.component.html",
  styleUrls: ["./pagina-sucesso.component.css"],
})
export class PaginaSucessoComponent implements OnInit {
  constructor(private router: Router) {}

  public isCarregando: boolean = false;

  ngOnInit(): void {
    this.isCarregando = true;
    this.delay(5000).then((any) => {
      this.isCarregando = false;
    });
  }

  gotoNovo() {
    this.router.navigate(["pedido"]);
  }

  async delay(ms: number) {
    await new Promise((resolve) => setTimeout(() => resolve(), ms)).then(() =>
      console.log("fired")
    );
  }
}
