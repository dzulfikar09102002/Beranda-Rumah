<?php

namespace App\Enums;

enum InventorySource: string
{
    case PURCHASE = 'purchase';
    case ADJUSTMENT = 'adjustment';
    case SALE = 'sale';
    case DAMAGE = 'damage';
    case RETURN = 'return';
    case TRANSFER = 'transfer';
    case OTHER = 'other';
}