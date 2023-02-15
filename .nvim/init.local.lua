USER.load_local_config({
    use_session        = true, -- Use local session
    use_spellfile      = true, -- Use local spell file
    use_vale           = false, -- Use Vale linter(with local spell file)
    use_palettes       = false, -- Use local hexokinase palettes
    use_prettier       = true, -- Copy .prettierrc from templates folder
    use_format_on_save = true, -- Enable LSP format on save
})
