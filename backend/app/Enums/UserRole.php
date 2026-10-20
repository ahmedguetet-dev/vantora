<?php

namespace App\Enums;

enum UserRole: string
{
    case Customer = 'customer';
    case Manager = 'manager';
    case Admin = 'admin';

    public function isStaff(): bool
    {
        return $this !== self::Customer;
    }
}