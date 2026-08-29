<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Setting extends Model
{
    public $timestamps = false;
    
    protected $primaryKey = 'property';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'property',
        'value',
    ];
}