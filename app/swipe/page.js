const swipe = async (direction) => {
    if (!fighters[current]) return
    setSwiping(direction)
    const swiped = fighters[current]

    const { error: swipeError } = await supabase.from('swipes').insert({
      swiper_id: user.id,
      swiped_id: swiped.id,
      direction
    })

    console.log('Swipe inserted:', direction, swipeError)

    if (direction === 'right') {
      const { data: theirSwipe, error: checkError } = await supabase
        .from('swipes')
        .select('*')
        .eq('swiper_id', swiped.id)
        .eq('swiped_id', user.id)
        .eq('direction', 'right')

      console.log('Their swipe check:', theirSwipe, checkError)

      if (theirSwipe && theirSwipe.length > 0) {
        const { data: match, error: matchError } = await supabase
          .from('matches')
          .insert({
            user1_id: user.id,
            user2_id: swiped.id
          })
          .select()
          .single()

        console.log('Match created:', match, matchError)

        setTimeout(() => {
          setSwiping(null)
          alert(`🥊 It's a Match with ${swiped.name}!`)
          setCurrent(prev => prev + 1)
        }, 300)
        return
      }
    }

    setTimeout(() => {
      setSwiping(null)
      setCurrent(prev => prev + 1)
    }, 300)
  }