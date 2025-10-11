import React, { useState, useEffect } from 'react';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '../ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Button } from '../ui/button';
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useClientStore } from '../../lib/stores/clientStore';
import { Client } from '../../types';

interface SmartClientSearchProps {
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function SmartClientSearch({ value, onValueChange, placeholder = "Выберите клиента", className }: SmartClientSearchProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { clients, fetchClients } = useClientStore();
  
  useEffect(() => {
    fetchClients();
  }, [fetchClients]);
  
  const selectedClient = clients.find(c => c.id === value);
  
  const filteredClients = searchQuery
    ? clients.filter(client => 
        client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        client.company?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        client.contacts.some(contact => 
          contact.phone?.includes(searchQuery) ||
          contact.email?.toLowerCase().includes(searchQuery.toLowerCase())
        )
      )
    : clients;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between", className)}
        >
          {selectedClient ? (
            <div className="flex flex-col items-start">
              <span className="font-medium">{selectedClient.name}</span>
              {selectedClient.company && (
                <span className="text-xs text-muted-foreground">{selectedClient.company}</span>
              )}
            </div>
          ) : (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0" align="start">
        <Command>
          <CommandInput 
            placeholder="Поиск по имени, компании, телефону, email..." 
            value={searchQuery}
            onValueChange={setSearchQuery}
          />
          <CommandList>
            <CommandEmpty>Клиент не найден</CommandEmpty>
            <CommandGroup>
              {filteredClients.map((client) => (
                <CommandItem
                  key={client.id}
                  value={client.id}
                  onSelect={(currentValue) => {
                    onValueChange(currentValue === value ? "" : currentValue);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === client.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <div className="flex flex-col">
                    <span className="font-medium">{client.name}</span>
                    <div className="flex gap-2 text-xs text-muted-foreground">
                      {client.company && <span>{client.company}</span>}
                      {client.contacts[0]?.phone && <span>• {client.contacts[0].phone}</span>}
                      {client.contacts[0]?.email && <span>• {client.contacts[0].email}</span>}
                    </div>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
