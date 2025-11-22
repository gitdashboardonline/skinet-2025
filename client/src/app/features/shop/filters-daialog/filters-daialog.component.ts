import { Component, inject } from '@angular/core';
import { ShopService } from '../../../core/services/shop.service';
import { MatDivider } from '@angular/material/divider';
import { MatSelectionList, MatListOption } from '@angular/material/list';
import { MatAnchor, MatButton } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-filters-daialog',
  imports: [MatButton,
    FormsModule, MatDivider, MatSelectionList, MatListOption, MatAnchor],
  templateUrl: './filters-daialog.component.html',
  styleUrl: './filters-daialog.component.scss',
})
export class FiltersDaialogComponent {
  shopService = inject(ShopService);
  private dialogRef =inject(MatDialogRef<FiltersDaialogComponent>)

  data = inject(MAT_DIALOG_DATA);
  selectedBrands: string[] = this.data.selectedBrands;
  selectedTypes: string[] = this.data.selectedTypes;

  applyFilters(){
    this.dialogRef.close({
      selectedBrands:this.selectedBrands,
      selectedTypes:this.selectedTypes
    });
  }

}
