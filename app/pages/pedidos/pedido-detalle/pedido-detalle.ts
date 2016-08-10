import { Component } from '@angular/core';
import { NavController, NavParams, Loading, Alert, Toast} from 'ionic-angular';
import {Pedidos, Pedido, Item} from '../../../providers/pedidos/pedidos';
import {CatalogoPage} from '../../catalogo/catalogo';
import {PerfilesDetallePage} from '../../catalogo/perfiles-detalle/perfiles-detalle';
import {PedidoConfigPage} from '../pedido-config/pedido-config';
import {HomePage} from '../../home/home';


@Component({
  templateUrl: 'build/pages/pedidos/pedido-detalle/pedido-detalle.html',
  providers: [Pedidos]
})
export class PedidoDetallePage {
  title: string;
  isEdit: boolean;
  pedido: Pedido;
  items: Array<Item>;
  isModify: boolean;

  constructor(private navCtrl: NavController, private parametros: NavParams, private pedidosP: Pedidos) {
    this.pedido = this.parametros.get('pedido');
    this.items = this.pedido.detalle;
    this.isEdit = this.parametros.get('edit');
    this.title = 'Pedido ' + ((this.isEdit) ? 'Actual' : this.pedido.id);
  }

  goCatalogo() {
    this.navCtrl.push(CatalogoPage);
  }

  goPerfil(item: Item) {
    this.navCtrl.push(PerfilesDetallePage, { 'perfil': item.perfil, 'add': false })
  }

  goConfig() {
    this.navCtrl.push(PedidoConfigPage, { 'pedido': this.pedido });
  }

  selectIsPedido(isPedido: boolean) {
    this.pedido.isPedido = isPedido;
  }

  sendPedido() {
    let load = Loading.create({
      content: 'Enviando pedido...',
      duration: 3000
    });
    let t = Toast.create({ duration: 3000 });
    this.navCtrl.present(load).then(() => {
      this.pedidosP.sendPedido(this.pedido).subscribe(res => {
        this.navCtrl.setRoot(HomePage);
        load.dismiss().then(() => {
          t.setMessage(res.message);
          this.navCtrl.present(t);
        });
      }, err => {
        console.log(err);
        load.dismiss().then(() => {
          t.setMessage(err.message);
          this.navCtrl.present(t);
        });
      }, () => {
        load.dismiss();
      })
    });
  }

  saveChanges() {
    this.pedido.detalle = this.items;
    this.pedidosP.saveActual(this.pedido)
      .subscribe(res => {
        this.items = <Array<Item>>JSON.parse(JSON.stringify(this.pedido.detalle));
        this.isModify = false;
      }, error => {
        console.error(error);
      })
  }

  cancelChanges() {
    this.items = <Array<Item>>JSON.parse(JSON.stringify(this.pedido.detalle));
    this.isModify = false
  }

  removeItem(item) {
    let confirm = Alert.create({
      title: 'Quitar Item?',
      message: 'Esta seguro que desea quitar el item del pedido',
      buttons: [{ text: 'Cancelar' },
        {
          text: 'Aceptar',
          handler: () => {
            this.items.splice((this.items.findIndex(value => value === item)), 1);
            this.isModify = true;
          }
        }]
    });
    this.navCtrl.present(confirm);
  }

  incCantidad(item) {
    let t = Toast.create({
      duration: 500,
      position: 'middle'
    });
    let c = ++this.items.find(value => value === item).cantidad;
    t.setMessage('Cantidad: ' + c);
    this.navCtrl.present(t);
    this.isModify = true;
  }

  decCantidad(item) {
    let t = Toast.create({
      duration: 500,
      position: 'middle'
    });
    let c: number = 1;
    (this.items.find(value => value === item).cantidad > 1) ? c = --this.items.find(value => value === item).cantidad : 1;
    t.setMessage('Cantidad: ' + c);
    this.navCtrl.present(t);
    this.isModify = true;
  }

  calcularSubtotal(item: Item): number {
    return item.cantidad * ((item.perfil.pxm * (item.perfil.largo / 1000))
      + ((item.perfil.pxm * (item.perfil.largo / 1000)) * (item.color.incremento / 100)));
  }

  calculaTotal(): number {
    if (this.items) {
      let total: number = 0;
      this.items.forEach(item => {
        total += this.calcularSubtotal(item);
      });
      return total;
    } else {
      return 0;
    }
  }

}
